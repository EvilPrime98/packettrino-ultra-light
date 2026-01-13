import { UltraComponent, ultraState, UltraActivity } from "@ultra-light";
import { Props } from "./pc-menu-types";
import styles from "./pc-menu.module.css";

export default function DhcpButtons({ getFields, subscribeFields }: Props) {

    const [hasIp, setHasIp, subscribeHasIp] = ultraState(false); 

    const sync = (self: HTMLElement) => {
        //update state
        self.classList.toggle(styles["hidden"], !getFields().dhcpField);
        setHasIp(getFields().ipField !== "");
    }

    return (

        UltraComponent({

            component: `<div class=${styles["dhcp-buttons"]}></div>`,

            children: [

                UltraActivity({
                    component: `<button class="btn-modern-blue" type="button" id="get-btn">Obtener IP</button>`,
                    mode: {
                        state: () => !hasIp(),
                        subscriber: subscribeHasIp
                    },
                }),

                UltraActivity({
                    component: `<button class="btn-modern-blue" type="button" id="renew-btn">Renovar IP</button>`,
                    mode: {
                        state: hasIp,
                        subscriber: subscribeHasIp
                    },
                }),

                UltraActivity({
                    component: `<button class="btn-modern-blue" type="button" id="release-btn">Liberar IP</button>`,
                    mode: {
                        state: hasIp,
                        subscriber: subscribeHasIp
                    }
                })

            ],

            trigger: [{ subscriber: subscribeFields, triggerFunction: sync }]

        })

    )

}