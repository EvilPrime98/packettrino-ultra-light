# PackeTTrino — UltraLight Edition

A complete rewrite of [PackeTTrino](https://github.com/EvilPrime98/PackeTTrino) now built on top of **UltraLight**, a custom TypeScript reactive UI framework inspired by React I've been developing for the past year. This is an active work in progress. The original project remains available and functional.

## What's new

The original PackeTTrino was built entirely with vanilla JavaScript and no dependencies. This version takes that same philosophy further with a structured architecture:

- **TypeScript** throughout, with strict typing for network elements, packets, and device APIs
- **UltraLight framework** for reactive state management and component composition
- **CSS Modules** for scoped, collision-free styling
- **Extensible device API system** — each network element exposes a typed interface for configuration, state, and behavior

## UltraLight — Quick Example

Here's a simple counter component that showcases the core UltraLight API:

```ts
import { UltraComponent, UltraFragment, ultraState } from "./ultra-light/ultra-light";

export default function Counter() {

    const [getCount, setCount, subscribeToCount] = ultraState(0);

    function onIncrease($h1: HTMLElement) {
        $h1.innerHTML = `${getCount()}`;
    }

    return UltraFragment(

        UltraComponent({
            component: `<h1>${getCount()}</h1>`,
            trigger: [
                { subscriber: subscribeToCount, triggerFunction: onIncrease }
            ]
        }),

        UltraComponent({
            component: `<button>Increment</button>`,
            eventHandler: {
                'click': () => setCount(getCount() + 1)
            }
        })

    )

}
```

- `ultraState` works like React's `useState` but exposes a subscriber for fine-grained DOM updates
- `UltraComponent` wraps a raw HTML string and wires up event handlers and reactive triggers
- `UltraFragment` composes multiple components without an extra wrapper element
- When the button is clicked, only the `<h1>` is updated. No virtual DOM diffing, no full re-render.

---

## Status

| Feature | Status |
|---|---|
| Core framework integration | 🔄 In progress |
| Device component architecture | 🔄 In progress |
| Packet simulation engine | 🔄 In progress |
| DHCP / DNS / ARP protocols | ⏳ Planned |
| Terminal & packet analyzer UI | ⏳ Planned |

---

## Original Project

The stable, fully-featured version of PackeTTrino is available here:  
👉 [PackeTTrino (original)](https://github.com/EvilPrime98/PackeTTrino)

---

## About

Developed by **Amín Pérez**.