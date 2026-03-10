import { UltraComponent } from "ultra-light.js";
import type { UltraLightElement } from "ultra-light.js";

/**
 * This component is used to render a tab in a menu that is used to switch between different pages.
 * @returns 
 */
export function MenuTab({
    pageId,
    selectedClass,
    onClick,
    pageSubscriber,
    getCurrentPage
}: {
    /**
     * The id of the page this tab is for.
     */
    pageId: string,
    /**
     * The class to add to the tab when it is selected.
     */
    selectedClass: string,
    /**
     * The function to call when the tab is clicked.
     */
    onClick: () => void,
    /**
     * A function that subscribes to the current page and updates the tab's class.
     */
    pageSubscriber: (fn: (value: string) => void) => () => void,
    /**
     * A function that returns the current page.
     */
    getCurrentPage: () => string
}) {

    const capitalizedPageId = pageId.charAt(0).toUpperCase() + pageId.slice(1);

    return UltraComponent({
        component: `<button type="button">${capitalizedPageId}</button>`,
        className: [
            'btn-modern-blue', 
            (getCurrentPage() === pageId ? selectedClass : '')
        ],
        eventHandler: { 'click': onClick },
        trigger: [
            {
                subscriber: pageSubscriber,
                triggerFunction: (self: UltraLightElement) => {
                    self.classList.toggle(
                        selectedClass,
                        getCurrentPage() === pageId
                    );
                }
            }
        ]
    })

}