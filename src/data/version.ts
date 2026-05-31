// Central version constants. Sourcing from package.json files means a future
// `vendor/mcp-rune` submodule bump automatically propagates to every "what
// version of the framework does this docs site cover?" chrome surface.

import vendorPkg from '../../vendor/mcp-rune/package.json';
import sitePkg from '../../package.json';

export const MCP_RUNE_VERSION       = vendorPkg.version as string;
export const MCP_RUNE_VERSION_LABEL = `v${MCP_RUNE_VERSION}`;

export const SITE_VERSION       = sitePkg.version as string;
export const SITE_VERSION_LABEL = `v${SITE_VERSION}`;
