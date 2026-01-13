import { UltraComponent } from "@ultra-light";
import styles from "./pc-menu.module.css";  
export default function BasicButtons({ closeHandler, saveHandler } : {
    closeHandler: () => void;
    saveHandler: () => void;
}) {

    return (

        UltraComponent({

            component: `<div class=${styles["basic-buttons"]}></div>`,

            children: [

                UltraComponent({
                    component: `<button class="btn-modern-blue" type="button" id="save-btn">Save</button>`,
                    eventHandler: { 'click': saveHandler }
                }),

                UltraComponent({
                    component: `<button class="btn-modern-red"  type="button" id="close-btn">Close</button>`,
                    eventHandler: { 'click': closeHandler }
                })

            ]

        })

    )

}
