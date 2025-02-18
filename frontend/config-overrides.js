const webpack = require('webpack');

module.exports = function override(config) {
  // Настройка fallback для отсутствующих модулей
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    zlib: require.resolve('browserify-zlib'),
    buffer: require.resolve('buffer'),
  };

  // Убедитесь, что 'node_modules' включены в модули для разрешения
  config.resolve.modules = [
    ...(config.resolve.modules || []),
    'node_modules',
  ];

  return config;
};
