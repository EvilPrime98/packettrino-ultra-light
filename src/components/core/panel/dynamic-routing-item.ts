import { UltraComponent } from "ultra-light.js";

export function dynamicRoutingButton() {

    return (

        UltraComponent({
            component: `
                <article
                    class="item dynrouting"
                    draggable="false"
                >
                    <img src="/panel/dynrouter.svg" alt="dynrouting" draggable="false">
                    <div class="pulse"></div>
                    <div class="radar-line"></div>
                </article>
            `
        })

    )
    
}