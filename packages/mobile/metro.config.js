const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// In this monorepo, frontend uses React 19 and mobile uses React 18.
// With hoisted linking, React 19 lands at the root node_modules, so Metro
// (and all transitive deps like expo-router) would pick it up. We intercept
// resolution to force react and react-dom to the mobile package's v18.
const reactPaths = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (reactPaths[moduleName]) {
    return { type: 'sourceFile', filePath: require.resolve(moduleName, { paths: [projectRoot] }) };
  }
  // Handle react/xxx and react-dom/xxx sub-paths
  for (const [pkg, pkgPath] of Object.entries(reactPaths)) {
    if (moduleName.startsWith(pkg + '/')) {
      const subPath = moduleName.slice(pkg.length);
      return { type: 'sourceFile', filePath: require.resolve(pkgPath + subPath) };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
