import { execSync } from 'child_process';
import type { Options } from '@wdio/types';
import { config as baseConfig } from './wdio.conf';
import { dismissAndroidSystemSheets } from './tests/helpers/ui';

function resolveDeviceUdid(): string {
  const fromEnv = process.env.ANDROID_SERIAL?.trim() || process.env.MOBILE_ADB_DEVICE?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  try {
    const out = execSync('adb devices', { encoding: 'utf-8' });
    const line = out
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .find((l) => l.endsWith('device') && !l.startsWith('*'));
    if (line) {
      return line.split(/\s+/)[0];
    }
  } catch {
    /* adb not on PATH yet */
  }
  return 'emulator-5554';
}

const udid = resolveDeviceUdid();

export const config: Options.Testrunner = {
  ...baseConfig,
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': udid,
      'appium:udid': udid,
      'appium:systemPort': 8200,
      'appium:automationName': 'UiAutomator2',
      'appium:appPackage': 'au.com.cricket',
      'appium:appActivity': '.ui.SplashActivity',
      'appium:noReset': true,
      'appium:autoGrantPermissions': true,
      'appium:disableWindowAnimation': true,
      'appium:newCommandTimeout': 240,
    },
  ],
  reporters: ['spec'],
  before: async () => {
    await dismissAndroidSystemSheets(16);
  },
};
