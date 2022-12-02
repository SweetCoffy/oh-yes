import { APIEmbed, JSONEncodable } from "discord.js";

/**
 * Alias for `APIEmbed | JSONEncodable<APIEmbed>`
 */
export type DiscordEmbed = APIEmbed | JSONEncodable<APIEmbed>