import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const installApks = (deviceId: string, apksDir: string) => {
  console.log(`Scanning for APKs in ${apksDir}...`);

  if (!fs.existsSync(apksDir)) {
    console.error(`Directory not found: ${apksDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(apksDir)
    .filter((file) => file.endsWith('.apk'))
    .map((file) => path.join(apksDir, file));

  if (files.length === 0) {
    console.error(`No APKs found in ${apksDir}`);
    process.exit(1);
  }

  const apkPaths = files.map((f) => `"${f}"`).join(' ');
  const cmd = `adb -s ${deviceId} install-multiple -r ${apkPaths}`;

  console.log(`\nInstalling APKs on ${deviceId}...`);
  console.log(`Executing: ${cmd}`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`SUCCESS: APKs installed on ${deviceId}`);

    const installedPackageId = process.env.MOBILE_APP_PACKAGE ?? 'au.com.cricket';
    const verifyCmd = `adb -s ${deviceId} shell pm list packages ${installedPackageId}`;
    const result = execSync(verifyCmd).toString();
    if (result.includes(installedPackageId)) {
      console.log(`Verified package ${installedPackageId} on ${deviceId}\n`);
    } else {
      console.warn(
        `Warning: install succeeded but package ${installedPackageId} not found on ${deviceId}\n`
      );
    }
  } catch (error) {
    console.error(`FAILED to install APKs on ${deviceId}:`, error);
    process.exit(1);
  }
};

function devicesToInstall(): string[] {
  const single =
    process.env.MOBILE_ADB_DEVICE?.trim() || process.env.ANDROID_SERIAL?.trim();
  if (single) {
    return [single];
  }
  return ['emulator-5554', 'emulator-5556'];
}

const artifactsDir = path.resolve(__dirname, '../artifacts');

for (const deviceId of devicesToInstall()) {
  console.log(`Installing APKs to ${deviceId}...`);
  installApks(deviceId, artifactsDir);
}
