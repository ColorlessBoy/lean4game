import * as React from 'react';
import { Outlet, useParams } from "react-router-dom";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './css/reset.css';
import './css/app.css';
import { PreferencesContext} from './components/infoview/context';
import UsePreferences from "./state/hooks/use_preferences"
import i18n from './i18n';
import { Layout } from './components/layout/Layout';
import { useGetGameInfoQuery } from './state/api';

export const GameIdContext = React.createContext<string>(undefined);

function App() {
  const params = useParams()
  const gameId = "g/" + params.owner + "/" + params.repo

  const {mobile, layout, isSavePreferences, language, setLayout, setIsSavePreferences, setLanguage} = UsePreferences()
  const [rulesHelp, setRulesHelp] = React.useState(false)
  const gameInfo = useGetGameInfoQuery({game: gameId})

  React.useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])

  return (
    <div className="app">
      <GameIdContext.Provider value={gameId}>
        <PreferencesContext.Provider value={{mobile, layout, isSavePreferences, language, setLayout, setIsSavePreferences, setLanguage}}>
          <Layout
            worlds={gameInfo.data?.worlds}
            worldToc={gameInfo.data?.worldToc}
            worldSize={gameInfo.data?.worldSize}
            rulesHelp={rulesHelp}
            setRulesHelp={setRulesHelp}>
            <React.Suspense>
              <Outlet />
            </React.Suspense>
          </Layout>
        </PreferencesContext.Provider>
      </GameIdContext.Provider>
    </div>
  )
}

export default App
