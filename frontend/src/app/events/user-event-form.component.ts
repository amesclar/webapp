import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../api.service";
import { firstValueFrom } from "rxjs";
import { EventRow } from "../api.types";

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container">
      <div class="header">
        <button class="btn-secondary" (click)="back()">← Back</button>
        <h1>Event Details</h1>
      </div>

      <div *ngIf="loading()" class="loading">Loading event details...</div>

      <div *ngIf="!loading() && event()" class="card">
        <div class="row">
          <label>Event Locator</label>
          <input [value]="event()?.event_locator" readonly class="readonly" />
        </div>
        <div class="row">
          <label class="required-label">Description <span class="asterisk">*</span></label>
          <input [(ngModel)]="desc" placeholder="e.g. Annual Gala" required />
        </div>
        <div class="row">
          <label class="required-label">Date <span class="asterisk">*</span></label>
          <input [(ngModel)]="date" placeholder="YYYY-MM-DD" required />
        </div>
        <div class="row">
          <label>Tax ID</label>
          <input [(ngModel)]="taxId" placeholder="Optional" />
        </div>
        <div class="row">
          <label>Contact First Name</label>
          <input [(ngModel)]="contactFirstName" placeholder="Optional" />
        </div>
        <div class="row">
          <label>Contact Last Name</label>
          <input [(ngModel)]="contactLastName" placeholder="Optional" />
        </div>
        <div class="row">
          <label>Contact Email</label>
          <input type="email" [(ngModel)]="contactEmail" placeholder="user@example.com" />
        </div>
        <div class="row">
          <label>Contact Phone</label>
          <input [(ngModel)]="contactPhone" placeholder="Optional" />
        </div>
        
        <div class="actions">
          <button class="btn-primary" (click)="save()" [disabled]="busy() || !desc || !date">Save</button>
          <form (submit)="confirmDelete($event)" style="display: inline;">
            <button type="submit" class="btn-danger" [disabled]="busy()">Delete</button>
          </form>
          <button class="btn-secondary" (click)="back()">Cancel</button>
        </div>

        <div class="ok" *ngIf="success()">{{ success() }}</div>
        <div class="error" *ngIf="error()">{{ error() }}</div>
      </div>

      <div *ngIf="!loading() && !event()" class="error-card">
        <h1>Event Not Found</h1>
        <p>We couldn't find the event details.</p>
        <button (click)="back()">Back</button>
      </div>
    </div>
  `,
    styles: [`
    .container { padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
    .card { padding: 30px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #000; }
    .row { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; color: #000; }
    input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; color: #000; background: white; }
    input.readonly { background: #f8f9fa; cursor: not-allowed; }
    .actions { display: flex; gap: 10px; margin-top: 20px; }
    button { padding: 10px 20px; cursor: pointer; border-radius: 4px; border: none; font-weight: 500; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .ok { color: #28a745; margin-top: 10px; font-weight: bold; }
    .error { color: #dc3545; margin-top: 10px; font-weight: bold; }
    .asterisk { color: #dc3545; }
    input:required:invalid { border-color: rgba(220, 53, 69, 0.5); }
    .loading { font-size: 1.2rem; color: #000; text-align: center; margin-top: 50px; }
    .error-card { padding: 40px; background: #fff5f5; border-radius: 12px; border: 1px solid #feb2b2; text-align: center; color: #000; }
  `]
})
export class UserEventFormComponent implements OnInit {
    locator: string | null = null;
    event = signal<EventRow | null>(null);
    loading = signal(true);
    busy = signal(false);
    success = signal<string | null>(null);
    error = signal<string | null>(null);

    desc = "";
    date = "";
    taxId = "";
    contactFirstName = "";
    contactLastName = "";
    contactEmail = "";
    contactPhone = "";

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiService
    ) { }

    async ngOnInit() {
        this.locator = this.route.snapshot.queryParamMap.get("event_locator");
        if (this.locator) {
            await this.loadEvent();
        } else {
            this.loading.set(false);
        }
    }

    async loadEvent() {
        try {
            const results = await firstValueFrom(this.api.listEvents(undefined, this.locator!));
            if (results && results.length > 0) {
                const e = results[0];
                this.event.set(e);
                this.desc = e.event_desc;
                this.date = e.event_date ? e.event_date.split("T")[0] : "";
                this.taxId = e.event_tax_id || "";
                this.contactFirstName = e.contact_first_name || "";
                this.contactLastName = e.contact_last_name || "";
                this.contactEmail = e.contact_email || "";
                this.contactPhone = e.contact_phone || "";
            }
        } catch (e) {
            console.error("Error loading event", e);
        } finally {
            this.loading.set(false);
        }
    }

    back() {
        if (this.locator) {
            this.router.navigate(["/user", this.locator]);
        } else {
            this.router.navigate(["/admin"]);
        }
    }

    async save() {
        if (!this.event()) return;
        this.busy.set(true);
        this.success.set(null);
        this.error.set(null);
        try {
            const res = await firstValueFrom(this.api.updateEvent(this.event()!.event_id, {
                event_desc: this.desc,
                event_date: this.date,
                event_tax_id: this.taxId || null,
                contact_first_name: this.contactFirstName || null,
                contact_last_name: this.contactLastName || null,
                contact_email: this.contactEmail || null,
                contact_phone: this.contactPhone || null
            }));
            this.success.set("Event updated successfully!");
            // If the locator changed (unlikely with our logic but possible by description), 
            // we might need to update the URL. But locator is derived from ID, so it shouldn't change.
        } catch (e: any) {
            const errorMsg = e?.error?.details?.[0]?.message || e?.error?.message || e?.message || "Error saving event";
            this.error.set(errorMsg);
        } finally {
            this.busy.set(false);
        }
    }

    async confirmDelete(ev: Event) {
        ev.preventDefault();
        if (!this.event()) return;
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        this.busy.set(true);
        try {
            await firstValueFrom(this.api.deleteEvent(this.event()!.event_id));
            this.router.navigate(["/admin"]);
        } catch (e: any) {
            const errorMsg = e?.error?.message || e?.message || "Error deleting event";
            this.error.set(errorMsg);
            this.busy.set(false);
        }
    }
}
