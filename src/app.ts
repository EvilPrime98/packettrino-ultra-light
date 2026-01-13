import { 
    UltraFragment, 
    ultraState
} from "@ultra-light";
import AppLoader from "@components/core/app-loader.ts";
import { ENV_PROVIDER } from "./context/env.ts";
import { MODALS_PROVIDER } from "./context/modals.ts";
import { WorkSpace } from "@components/core/work-space.ts";
import Panel from "@components/core/panel.ts";
import { Toaster } from "./components/core/toaster.ts";
import Terminal from "./components/tools/cli/terminal.ts";

export default function App() {

    const [isLoaded, setIsLoaded, subscribeIsLoaded] = ultraState(false);

    setTimeout(() => {
        setIsLoaded(true);
    }, 500);

    return UltraFragment(

        ENV_PROVIDER(

            AppLoader({ isLoaded, subscribeIsLoaded }),
            
            Toaster(),

            MODALS_PROVIDER(
                Terminal(),
                WorkSpace(),
            ),

            Panel({ isLoaded, subscribeIsLoaded })

        )

    );

}