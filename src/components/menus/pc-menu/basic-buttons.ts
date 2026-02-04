import { UltraComponent } from "@ultra-light";
import styles from "./pc-menu.module.css";  

export default function BasicButtons({ 
    onSave 
} : {
    onSave: () => void;
}) {

    return (

        UltraComponent({

            component: `<div class=${styles["basic-buttons"]}></div>`,

            children: [

                UltraComponent({
                    component: `<button class="btn-modern-blue" type="button" id="save-btn">Save</button>`,
                    eventHandler: { 'click': onSave }
                })

            ]

        })

    )

}
