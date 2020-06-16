export function getChannelLabelFromIndex(channelName, allChannels) {
	let label = null;
	allChannels.forEach((channel, index) => {
		if (channel.name === channelName) {
			label = index + 1;
		}
	});
	return label;
}
