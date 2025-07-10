// Memory optimizer utilities to prevent storage overflow
export class MemoryOptimizer {
  static limitArraySize(array, maxSize = 100) {
    if (!Array.isArray(array)) return array;
    return array.slice(0, maxSize);
  }

  static clearLargeObjects(obj, maxProps = 1000) {
    if (!obj || typeof obj !== 'object') return obj;

    const keys = Object.keys(obj);
    if (keys.length > maxProps) {
      console.warn(
        `Object has ${keys.length} properties, limiting to ${maxProps}`,
      );
      const limitedObj = {};
      keys.slice(0, maxProps).forEach(key => {
        limitedObj[key] = obj[key];
      });
      return limitedObj;
    }
    return obj;
  }

  static optimizeStateUpdate(prevState, newData, maxItems = 50) {
    if (Array.isArray(prevState)) {
      const combined = [...prevState, ...newData];
      return combined.slice(-maxItems); // Keep only last N items
    }
    return newData;
  }

  static debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  static throttle(func, limit = 1000) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static cleanupComponentState(setState, defaultValue) {
    return () => {
      try {
        setState(defaultValue);
      } catch (error) {
        console.error('Error cleaning up state:', error);
      }
    };
  }

  static monitorMemoryUsage() {
    if (__DEV__) {
      const interval = setInterval(() => {
        try {
          // Check if performance API is available (web only)
          if (
            typeof window !== 'undefined' &&
            window.performance &&
            window.performance.memory
          ) {
            const memory = window.performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1048576);
            const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

            console.log(`Memory usage: ${used}MB / ${limit}MB`);

            if (used > limit * 0.8) {
              console.warn('High memory usage detected!');
            }
          }
        } catch (error) {
          // Performance API not available in React Native
          console.log('Memory monitoring not available on this platform');
        }
      }, 5000);

      return () => clearInterval(interval);
    }
    return () => {};
  }
}

export default MemoryOptimizer;
