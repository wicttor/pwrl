---
title: Async State Race Condition in Effect Cleanup
date: 2026-04-30
category: technical-fix
tags: [async, react, race-condition, useEffect, cleanup]
severity: medium
---

# Async State Race Condition in Effect Cleanup

## Problem

Component was setting state after unmounting, causing "Can't perform a React state update on an unmounted component" warnings and potential memory leaks.

## Symptoms

- Console warning: `Warning: Can't perform a React state update on an unmounted component`
- Occurred when navigating away from page before API call completed
- Warning appeared intermittently, more frequent on slow connections

## What Didn't Work

- **Adding conditional check**: Tried checking if component is mounted before setState, but this is considered an anti-pattern and doesn't prevent the warning
- **Using `.catch()` to ignore errors**: Doesn't prevent the setState from attempting to run

## Solution

Use cleanup function to cancel the async operation or flag it as stale:

```javascript
// Before (broken)
useEffect(() => {
  async function fetchData() {
    const result = await api.getData();
    setData(result); // Can run after unmount
  }
  fetchData();
}, []);

// After (working)
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const result = await api.getData();
    if (!cancelled) {
      setData(result); // Only updates if still mounted
    }
  }

  fetchData();

  return () => {
    cancelled = true; // Cleanup marks operation as stale
  };
}, []);
```

## Why It Works

The cleanup function runs when the component unmounts. Setting `cancelled = true` flags any in-flight operations as stale, preventing setState calls after unmount. This is React's recommended pattern for handling async operations in effects.

## Prevention

- Always use cleanup functions for async operations in useEffect
- Consider using `AbortController` for fetch requests to actually cancel network calls
- Use a custom hook to encapsulate this pattern:

```javascript
function useSafeAsync() {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

// Usage
const mounted = useSafeAsync();
// ... later in async function
if (mounted.current) {
  setState(value);
}
```

## Related

- [React docs: Cleanup function](https://react.dev/reference/react/useEffect#cleaning-up)
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
