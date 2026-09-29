import { registerDedupe } from '../src/bg/dedupe';
import { registerScanner, scan } from '../src/bg/scanner';
import { autoOn, execute, schedule } from '../src/bg/actions';
import { autoEnabledAt, pausedUntil, pendingActions, settingsItem } from '../src/bg/state';

export default defineBackground(() => {
  registerDedupe();
  registerScanner(schedule);
  settingsItem.watch(async (next, previous) => {
    if (!autoOn(next)) {
      await pendingActions.setValue([]);
      await browser.alarms.clear('grace');
    } else if ((!previous || !autoOn(previous)) && !(await autoEnabledAt.getValue()))
      await autoEnabledAt.setValue(Date.now());
  });
  browser.alarms.onAlarm.addListener((a) => {
    if (a.name === 'grace') execute();
    if (a.name === 'clearBadge') browser.action.setBadgeText({ text: '' }).then(scan);
  });
  browser.commands.onCommand.addListener(async (cmd) => {
    if (cmd === 'pause-toggle') {
      const until = await pausedUntil.getValue();
      await pausedUntil.setValue(until > Date.now() ? 0 : Date.now() + 15 * 60_000);
    }
  });
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install')
      browser.tabs.create({
        url: browser.runtime.getURL('/onboarding.html' as never),
      });
  });
});
