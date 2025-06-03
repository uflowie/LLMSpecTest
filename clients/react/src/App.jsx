import { Link, Route, Switch } from "wouter";
import GeminiDiffusion from "./gemini-diffusion";
import Mistral from "./mistral";
import Claude from "./claude";
import O3 from "./o3";
import Gemini from "./gemini";


const App = () => (
  <>
    {/* 
      Routes below are matched exclusively -
      the first matched route gets rendered
    */}
    <Switch>
      <Route path="/gemini-diffusion" component={GeminiDiffusion} />
      <Route path="/mistral" component={Mistral} />
      <Route path="/claude" component={Claude} />
      
      <Route path="/o3" component={O3} />
      <Route path="/gemini" component={Gemini} />

      {/* Default route in a switch */}
      <Route>404: No such page!</Route>
    </Switch>
  </>
);

export default App;
