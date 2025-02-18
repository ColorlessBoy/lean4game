/**
 * @fileOverview Define the menu displayed with the tree of worlds on the welcome page
*/
import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Slider, List, ListItem, ListItemText, Collapse, Box, ListItemButton } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCircleQuestion, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'

import { GameIdContext } from '../app'
import { useAppDispatch } from '../hooks'
import { selectDifficulty, changedDifficulty, selectCompleted } from '../state/progress'
import { store } from '../state/store'

import '../css/world_tree.css'
import { PreferencesContext } from './infoview/context'
import { useTranslation } from 'react-i18next'
import { WorldTocType, WorldType } from '../state/api'

// colours
const grey = '#999'
const green = '#118a11'
const blue = '#1976d2'
const darkgrey = '#868686'
const darkgreen = '#0e770e'
const darkblue = '#1667b8'

/** The menu that is shown next to the world selection list */
export function WorldSelectionMenu({rulesHelp, setRulesHelp}) {
  const { t } = useTranslation()
  const gameId = React.useContext(GameIdContext)
  const difficulty = useSelector(selectDifficulty(gameId))
  const dispatch = useAppDispatch()
  const { mobile } = React.useContext(PreferencesContext)

  function label(x : number) {
    return x == 0 ? t("none") : x == 1 ? t("relaxed") : t("regular")
  }

  return <nav className={`world-selection-menu${mobile ? '' : ' desktop'}`}>
    <div className="slider-wrap">
      <span className="difficulty-label">{t("Rules")}
        <FontAwesomeIcon icon={rulesHelp ? faXmark : faCircleQuestion} className='helpButton' onClick={() => (setRulesHelp(!rulesHelp))}/>
      </span>
      <Slider
        orientation="vertical"
        title={t("Game Rules")}
        min={0} max={2}
        aria-label={t("Game Rules")}
        value={difficulty}
        marks={[
          {value: 0, label: label(0)},
          {value: 1, label: label(1)},
          {value: 2, label: label(2)}
        ]}
        valueLabelFormat={label}
        getAriaValueText={label}
        valueLabelDisplay="off"
        onChange={(ev, val: number) => {
          dispatch(changedDifficulty({game: gameId, difficulty: val}))
        }}
        ></Slider>
    </div>
  </nav>
}

/** Perform topological sort on the worlds graph */
function topologicalSort(worlds: WorldType) {
  const visited = new Set()
  const temp = new Set()
  const order: string[] = []
  const graph = new Map()

  // Build adjacency list
  for (const id in worlds.nodes) {
    graph.set(id, [])
  }
  for (const [source, target] of worlds.edges) {
    graph.get(source).push(target)
  }

  function visit(id: string): boolean {
    if (temp.has(id)) return false // Found cycle
    if (visited.has(id)) return true

    temp.add(id)

    const neighbors = graph.get(id) || []
    for (const next of neighbors) {
      if (!visit(next)) return false
    }

    temp.delete(id)
    visited.add(id)
    order.unshift(id)
    return true
  }

  for (const id in worlds.nodes) {
    if (!visited.has(id) && !visit(id)) {
      console.error('Cycle detected in worlds graph')
      return Object.keys(worlds.nodes) // Fallback to unsorted list
    }
  }

  return order
}

/** World list item component */
function WorldListItem({worldId, title, levelTitles, completedLevels, difficulty, worldSize, onNavigate} : {
  worldId: string,
  title: string,
  levelTitles: WorldTocType,
  completedLevels: number[],
  difficulty: number,
  worldSize: number,
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const gameId = React.useContext(GameIdContext)
  const location = useLocation()

  // 检查是否有任何子关卡是当前激活的
  const hasActiveLevel = React.useMemo(() => {
    return Array.from({length: worldSize}, (_, i) => i + 1).some(level =>
      location.pathname === `/${gameId}/world/${worldId}/level/${level}`
    )
  }, [location.pathname, gameId, worldId, worldSize])

  // 如果有激活的子关卡，则自动展开
  const [expanded, setExpanded] = React.useState(hasActiveLevel)

  // 当hasActiveLevel变化时更新expanded状态
  React.useEffect(() => {
    if (hasActiveLevel) {
      setExpanded(true)
    }
  }, [hasActiveLevel])

  // index `0` indicates that all prerequisites are completed
  const unlocked = completedLevels[0]
  // indices `1`-`n` indicate that the corresponding level is completed
  const completed = completedLevels.slice(1).every(Boolean)
  // select the first non-completed level
  let nextLevel: number = completedLevels.findIndex(c => !c)
  if (nextLevel <= 1) nextLevel = 0

  const playable = difficulty <= 1 || completed || unlocked
  const levels = Array.from({length: worldSize}, (_, i) => i + 1)

  const worldStyle = {
    backgroundColor: completed ? darkgreen : unlocked ? darkblue : darkgrey,
    color: 'white',
    borderRadius: '4px',
    marginBottom: '8px'
  }

  const levelStyle = (level: number) => {
    const isCurrentLevel = location.pathname === `/${gameId}/world/${worldId}/level/${level}`
    return {
      backgroundColor: isCurrentLevel ? '#ffd700' : completedLevels[level] ? green : unlocked ? blue : grey,
      color: isCurrentLevel ? '#000' : 'white',
      margin: '4px',
      borderRadius: '4px',
      opacity: difficulty >= 2 && !(completedLevels[level] || completedLevels[level-1]) ? 0.5 : 1,
      boxShadow: isCurrentLevel ? '0 0 0 2px #fff' : 'none'
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (worldSize > 0) {
      e.preventDefault()
      setExpanded(!expanded)
    }
    onNavigate?.() // Call onNavigate if provided
  }

  return (
    <Box sx={worldStyle}>
      <ListItemButton
        component={Link}
        to={playable ? `/${gameId}/world/${worldId}/level/${nextLevel}` : ''}
        onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          if (worldSize > 0) {
            e.preventDefault()
            setExpanded(!expanded)
          }
          onNavigate?.() // Call onNavigate to close sidebar
        }}
        aria-disabled={!playable}
      >
        {worldSize > 0 &&
          <FontAwesomeIcon
            icon={expanded ? faChevronDown : faChevronRight}
            style={{marginRight: '8px'}}
          />
        }
        <ListItemText primary={title || worldId} />
      </ListItemButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {levels.map(level => (
            <ListItemButton
              key={level}
              component={Link}
              to={difficulty >= 2 && !(completedLevels[level] || completedLevels[level-1])
                ? ''
                : `/${gameId}/world/${worldId}/level/${level}`}
              sx={levelStyle(level)}
              aria-disabled={difficulty >= 2 && !(completedLevels[level] || completedLevels[level-1])}
              onClick={() => onNavigate?.()} // Add onClick handler to close sidebar
            >
              <ListItemText primary={`${t(levelTitles[level.toString()] || 'untitled')}`} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </Box>
  )
}

export function WorldTocPanel({worlds, worldToc, worldSize, rulesHelp, setRulesHelp, setIsCollapsed, mobile}:
  { worlds: WorldType | null,
    worldToc: WorldTocType | null,
    worldSize: any,
    rulesHelp: boolean,
    setRulesHelp: any,
    setIsCollapsed?: (value: boolean) => void,
    mobile?: boolean
  }) {
  const gameId = React.useContext(GameIdContext)
  const difficulty = useSelector(selectDifficulty(gameId))

  // Get sorted world IDs based on dependencies
  const sortedWorldIds = worlds ? topologicalSort(worlds) : []

  // Track completion status for each world
  const completed = {}
  if (worlds && worldSize) {
    for (let worldId of sortedWorldIds) {
      completed[worldId] = Array.from({ length: worldSize[worldId] + 1 }, (_, i) => {
        return i == 0 || selectCompleted(gameId, worldId, i)(store.getState())
      })
    }

    // Update prerequisites based on world dependencies
    for (let edge of worlds.edges) {
      const sourceCompleted = completed[edge[0]].slice(1).every(Boolean)
      if (!sourceCompleted) {
        completed[edge[1]][0] = false
      }
    }
  }

  return <div className="column">
    <WorldSelectionMenu rulesHelp={rulesHelp} setRulesHelp={setRulesHelp} />
    <List sx={{width: '100%'}}>
      {sortedWorldIds.map(worldId => (
        <WorldListItem
          key={worldId}
          worldId={worldId}
          levelTitles={worldToc[worldId]}
          title={worlds.nodes[worldId].title}
          completedLevels={completed[worldId]}
          difficulty={difficulty}
          worldSize={worldSize[worldId]}
        />
      ))}
    </List>
  </div>
}
