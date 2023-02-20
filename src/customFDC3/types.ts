import { Channel, Context } from "@finsemble/finsemble-core";

//Types used in the custom FDC3 APIs - note the overlap on Channel, currently assuming it matches FDC3 2.0, but it may not. If so alias' will need to be used to differentiate the types and some adaption added.

export type LinkState = {
	channels: Array<Channel>;
	allChannels: Array<Channel>;
	channelDirections: Record<string, string>;
};

export type ChannelSource = {
	channels: string[];
	allChannels: Channel[];
};

export enum Direction {
	"Both" = "Both",
	"Listen" = "Listen",
	"Broadcast" = "Broadcast"
}
;

export type ChannelListenerHandler = (context: Context, source: ChannelSource) => void;
