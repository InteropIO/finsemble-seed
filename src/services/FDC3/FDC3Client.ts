import DesktopAgent from './desktopAgentClient';
import Channel from './channelClient';

console.log("FDC3Client");
const setupFDC3Client = () => {
    console.log("FDC3Client Ready");
	(FSBL as any).Clients.FDC3Client = {
        DesktopAgent: new DesktopAgent(),
    }
}

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if ((window as any).FSBL && (FSBL as any).addEventListener) {
	(FSBL as any).addEventListener("onReady", setupFDC3Client);
} else {
	window.addEventListener("FSBLReady", setupFDC3Client);
}


