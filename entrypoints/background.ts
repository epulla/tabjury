import { registerDedupe } from '../src/bg/dedupe';
import { registerScanner, scan } from '../src/bg/scanner';
import { pausedUntil } from '../src/bg/state';

export default defineBackground(() => {
  registerDedupe();
  registerScanner();
  browser.alarms.onAlarm.addListener(a => { if (a.name === 'clearBadge') browser.action.setBadgeText({ text: '' }).then(scan); });
  browser.commands.onCommand.addListener(async cmd => { if (cmd === 'pause-toggle') { const until = await pausedUntil.getValue(); await pausedUntil.setValue(until > Date.now() ? 0 : Date.now() + 15 * 60_000); } });
});
