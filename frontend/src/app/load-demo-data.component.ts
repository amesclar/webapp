import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ApiService } from "./api.service";
import { firstValueFrom } from "rxjs";

@Component({
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <div class="card">
        <h1>Demo Data Loader</h1>
        
        <div *ngIf="loading()" class="status">
          <div class="spinner"></div>
          <p>Generating random events, bidders, items, and winning bids...</p>
        </div>

        <div *ngIf="!loading() && result()" class="result">
          <div class="success-icon">✓</div>
          <h2>Success!</h2>
          <p>Demo data has been loaded successfully.</p>
          
          <div class="stats">
            <div class="stat-item">
              <span class="label">Event:</span>
              <span class="value">{{ result()?.event?.event_desc }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Bidders:</span>
              <span class="value">{{ result()?.biddersCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Items:</span>
              <span class="value">{{ result()?.itemsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Winning Bids:</span>
              <span class="value">{{ result()?.winningBidsCount }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn-primary" (click)="goToEvent()">Manage This Event</button>
            <button class="btn-secondary" (click)="back()">Back to Dashboard</button>
          </div>
        </div>

        <div *ngIf="!loading() && error()" class="error-box">
          <h2>Error</h2>
          <p>{{ error() }}</p>
          <button class="btn-secondary" (click)="back()">Back</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container { 
      padding: 40px 20px; 
      max-width: 600px; 
      margin: 0 auto; 
      min-height: 80vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    .card { 
      padding: 40px; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
      text-align: center; 
      width: 100%;
    }
    h1 { color: #2d3748; margin-bottom: 30px; }
    .status { padding: 20px; }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .success-icon {
      font-size: 48px;
      color: #38a169;
      margin-bottom: 20px;
    }
    
    .stats {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: left;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
    }
    .stat-item:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #4a5568; }
    .value { color: #2d3748; }

    .actions { display: flex; flex-direction: column; gap: 12px; margin-top: 30px; }
    button { padding: 12px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-primary { background: #3182ce; color: white; }
    .btn-primary:hover { background: #2b6cb0; }
    .btn-secondary { background: #edf2f7; color: #4a5568; }
    .btn-secondary:hover { background: #e2e8f0; }
    
    .error-box { color: #e53e3e; padding: 20px; }
  `]
})
export class LoadDemoDataComponent implements OnInit {
    loading = signal(true);
    result = signal<any>(null);
    error = signal<string | null>(null);

    constructor(private api: ApiService, private router: Router) { }

    async ngOnInit() {
        try {
            const res = await firstValueFrom(this.api.loadDemoData());
            this.result.set(res);
        } catch (e: any) {
            this.error.set(e?.error?.message || e?.message || "Failed to load demo data.");
        } finally {
            this.loading.set(false);
        }
    }

    goToEvent() {
        const locator = this.result()?.event?.event_locator;
        if (locator) {
            this.router.navigate(['/user', locator]);
        }
    }

    back() {
        this.router.navigate(['/admin']);
    }
}
