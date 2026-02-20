const port = Number(process.env.PORT || 3000);
import { createApp } from "./app.js";
import { purgeDemoData } from "./seed.js";

const app = createApp();

// Purge demo data on start and then every 24 hours
purgeDemoData();
setInterval(purgeDemoData, 24 * 60 * 60 * 1000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});

