import * as React from "react";
import { useEffect } from "react";
import Split from "react-split";
import { Box, CircularProgress } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { GameIdContext } from "../app";
import { useAppDispatch, useAppSelector } from "../hooks";
import { changedOpenedIntro, selectOpenedIntro } from "../state/progress";
import {
  useGetGameInfoQuery,
  useLoadInventoryOverviewQuery,
} from "../state/api";
import { Button } from "./button";
import { PreferencesContext } from "./infoview/context";
import { InventoryPanel } from "./inventory";
import { ErasePopup } from "./popup/erase";
import { InfoPopup } from "./popup/game_info";
import { PrivacyPolicyPopup } from "./popup/privacy_policy";
import { RulesHelpPopup } from "./popup/rules_help";
import { UploadPopup } from "./popup/upload";
import { PreferencesPopup } from "./popup/preferences";

import "../css/welcome.css";
import { Hint } from "./hints";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

/** the panel showing the game's introduction text */
function IntroductionPanel({
  introduction,
  setPageNumber,
}: {
  introduction: string;
  setPageNumber;
}) {
  const { mobile } = React.useContext(PreferencesContext);
  const gameId = React.useContext(GameIdContext);

  let { t } = useTranslation();

  const dispatch = useAppDispatch();

  // TODO: I left the setup for splitting up the introduction in place, but if it's not needed
  // then this can be simplified.

  // let text: Array<string> = introduction.split(/\n(\s*\n)+/)
  let text: Array<string> = introduction
    ? [t(introduction, { ns: gameId })]
    : [];

  return (
    <div className="column chat-panel">
      <div className="chat">
        {text?.map((t, i) =>
          t.trim() ? (
            <Hint
              key={`intro-p-${i}`}
              hint={{ text: t, hidden: false, rawText: t, varNames: [] }}
              step={0}
              selected={null}
              toggleSelection={undefined}
            />
          ) : (
            <></>
          )
        )}
      </div>
        <div className="button-row">
          <Button
            className="btn"
            to=""
            title=""
            onClick={() => {
              setPageNumber(1);
              dispatch(changedOpenedIntro({ game: gameId, openedIntro: true }));
            }}
          >
            {t("Start")}&nbsp;
            <FontAwesomeIcon icon={faArrowRight} />
          </Button>
        </div>
    </div>
  );
}

/*
<WelcomeAppBar pageNumber={pageNumber} setPageNumber={setPageNumber} gameInfo={gameInfo.data} toggleImpressum={toggleImpressum}
  toggleEraseMenu={toggleEraseMenu} toggleUploadMenu={toggleUploadMenu}
  toggleInfo={toggleInfo} togglePreferencesPopup={togglePreferencesPopup}/>
*/

/** main page of the game showing among others the tree of worlds/levels */
function Welcome() {
  const gameId = React.useContext(GameIdContext);

  // Load the namespace of the game
  i18next.loadNamespaces(gameId);

  const { mobile } = React.useContext(PreferencesContext);
  const {
    layout,
    isSavePreferences,
    language,
    setLayout,
    setIsSavePreferences,
    setLanguage,
  } = React.useContext(PreferencesContext);

  const gameInfo = useGetGameInfoQuery({ game: gameId });
  const inventory = useLoadInventoryOverviewQuery({ game: gameId });

  // For mobile only
  const openedIntro = useAppSelector(selectOpenedIntro(gameId));
  const [pageNumber, setPageNumber] = React.useState(openedIntro ? 1 : 0);

  const { t } = useTranslation();

  // pop-ups
  const [eraseMenu, setEraseMenu] = React.useState(false);
  const [impressum, setImpressum] = React.useState(false);
  const [info, setInfo] = React.useState(false);
  const [rulesHelp, setRulesHelp] = React.useState(false);
  const [uploadMenu, setUploadMenu] = React.useState(false);
  const [preferencesPopup, setPreferencesPopup] = React.useState(false);

  function closeEraseMenu() {
    setEraseMenu(false);
  }
  function closeImpressum() {
    setImpressum(false);
  }
  function closeInfo() {
    setInfo(false);
  }
  function closeRulesHelp() {
    setRulesHelp(false);
  }
  function closeUploadMenu() {
    setUploadMenu(false);
  }
  function closePreferencesPopup() {
    setPreferencesPopup(false);
  }
  function toggleEraseMenu() {
    setEraseMenu(!eraseMenu);
  }
  function toggleImpressum() {
    setImpressum(!impressum);
  }
  function toggleInfo() {
    setInfo(!info);
  }
  function toggleUploadMenu() {
    setUploadMenu(!uploadMenu);
  }
  function togglePreferencesPopup() {
    setPreferencesPopup(!preferencesPopup);
  }

  // set the window title
  useEffect(() => {
    if (gameInfo.data?.title) {
      window.document.title = gameInfo.data.title;
    }
  }, [gameInfo.data?.title]);

  return gameInfo.isLoading ? (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ height: "calc(100vh - 64px)" }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <>
      <div className="app-content">
        {mobile ? (
          <div className="welcome mobile">
            <IntroductionPanel
              introduction={gameInfo.data?.introduction}
              setPageNumber={setPageNumber}
            />
            <div className="exercise-statement" data-content={t("Inventory")}>
              <InventoryPanel levelInfo={inventory?.data} />
            </div>
          </div>
        ) : (
          <Split
            className="welcome"
            minSize={0}
            snapOffset={200}
            sizes={[60, 40]}
          >
            <IntroductionPanel
              introduction={gameInfo.data?.introduction}
              setPageNumber={setPageNumber}
            />
            <InventoryPanel levelInfo={inventory?.data} />
          </Split>
        )}
      </div>
      {impressum ? <PrivacyPolicyPopup handleClose={closeImpressum} /> : null}
      {rulesHelp ? <RulesHelpPopup handleClose={closeRulesHelp} /> : null}
      {eraseMenu ? <ErasePopup handleClose={closeEraseMenu} /> : null}
      {uploadMenu ? <UploadPopup handleClose={closeUploadMenu} /> : null}
      {info ? (
        <InfoPopup info={gameInfo.data?.info} handleClose={closeInfo} />
      ) : null}
      {preferencesPopup ? (
        <PreferencesPopup handleClose={closePreferencesPopup} />
      ) : null}
    </>
  );
}

export default Welcome;
