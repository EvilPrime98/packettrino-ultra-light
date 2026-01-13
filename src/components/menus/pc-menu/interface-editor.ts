import { UltraComponent } from "@ultra-light";
import SaveIcon from "@/components/icons/save-icon";
import styles from "./pc-menu.module.css";

export default function InterfaceEditor() {

    return(

        UltraComponent({

            component: `<div class="${styles['form-item-editor']}"></div>`,

            children: [

                UltraComponent({
                    component: `<label for="iface-editor">Edit Interface:</label>`
                }),

                UltraComponent({
                    component: `<input type="text" id="iface-editor" name="iface-editor">`
                }),

                SaveIcon({size: 50, className: styles['icon']})
            ]

        })

    )

}