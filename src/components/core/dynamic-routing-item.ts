import { UltraComponent } from "@ultra-light";

export function dynamicRoutingButton() {

    return (

        UltraComponent({
            component: `
                <article
                    class="item dynrouting"
                    draggable="false"
                >
                    <img src="./assets/panel/dynrouter.svg" alt="dynrouting" draggable="false">
                    <div class="pulse"></div>
                    <div class="radar-line"></div>
                </article>
            `
        })

    )
    
}