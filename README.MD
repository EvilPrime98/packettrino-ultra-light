# PackeTTrino — UltraLight Edition

A complete rewrite of [PackeTTrino](https://github.com/EvilPrime98/PackeTTrino), the web-based network simulator, now built on top of **UltraLight**, a custom TypeScript reactive UI framework inspired by React I've been developing for the past year. This is an active work in progress. The original project remains available and functional.

## What's new

The original PackeTTrino was built entirely with vanilla JavaScript and no dependencies. This version takes that same philosophy further with a structured, scalable architecture:

- **TypeScript** throughout, with strict typing for network elements, packets, and device APIs
- **UltraLight framework** for reactive state management and component composition
- **CSS Modules** for scoped, collision-free styling
- **Extensible device API system** — each network element exposes a typed interface for configuration, state, and behavior
- Cleaner separation between simulation logic and UI rendering

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