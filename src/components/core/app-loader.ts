import { UltraComponent } from "ultra-light.js";
import styles from "./app-loader.module.css";

type Props = {
    isLoaded: () => boolean;
    subscribeIsLoaded: (fn: (value: boolean) => void) => () => void;
}

export default function AppLoader({ isLoaded, subscribeIsLoaded }: Props) {

    const loadHandler = (self: HTMLElement) => {
        if (isLoaded()) {
            self.style.opacity = "0";
            setTimeout(() => {
                self.style.display = "none";
            }, 500);
        }
    }

    return UltraComponent({

        component: `
        <div class=${styles['loading-screen']}>
            <div class=${styles['loader-container']}>
                <div class=${styles['loader-animation']}>
                    <div class=${styles['circle']}></div>
                    <div class=${styles['circle']}></div>
                    <div class=${styles['circle']}></div>
                </div>
                <h1>PackeTTrino 2.0</h1>
                <p class=${styles['ultralight-text']}>Powered by <span>UltraLightJS</span></p>
                <p>Network Simulator</p>
                <p> By Amín Pérez <span>(2025)</span> </p>
            </div>
        </div>`,

        trigger: [
            { subscriber: subscribeIsLoaded, triggerFunction: loadHandler }
        ]

    });

}