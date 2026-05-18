import { FixtureFetcher } from '../common-utils/fixtureFetcher';
import * as fs from 'fs';

function writeGithubOutput(key: string, value: string): void {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  } else {
    console.log(`${key}=${value}`);
  }
}

async function run(): Promise<void> {
  const mode = process.env.CHECK_MATCHES_MODE ?? 'active';

  if (mode === 'skip') {
    writeGithubOutput('has_live_matches', 'true');
    console.log('Gate skipped (manual run); proceeding with tests.');
    process.exit(0);
    return;
  }

  if (mode === 'live') {
    const hasLive = await FixtureFetcher.hasLiveMatches();
    if (hasLive) {
      console.log('At least one IsLive fixture found on prod ticker.');
    } else {
      console.log('No IsLive fixtures on prod ticker — scheduler should skip tests.');
    }
    writeGithubOutput('has_live_matches', hasLive ? 'true' : 'false');
    process.exit(0);
    return;
  }

  const activeMatches = await FixtureFetcher.getActiveMatchIds();

  if (activeMatches.length > 0) {
    console.log(`Active matches found: ${activeMatches.join(', ')}`);
    writeGithubOutput('has_matches', 'true');
  } else {
    console.log('No active matches right now.');
    writeGithubOutput('has_matches', 'false');
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
