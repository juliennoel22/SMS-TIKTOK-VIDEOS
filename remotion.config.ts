// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);


Config.setColorSpace('bt709'); // or 'default', 'bt2020-ncl', 'bt2020-cl'
Config.setVideoImageFormat('png'); // for best color accuracy

import os from 'os';

Config.setConcurrency(os.cpus().length); // Use all available CPU cores
Config.setOverwriteOutput(true); // Overwrite previous renders
Config.setVideoImageFormat('jpeg'); // Use jpeg for faster rendering
Config.setJpegQuality(80); // Set JPEG quality (default is 80)
Config.setColorSpace('bt709'); // Use bt709 for color accuracy