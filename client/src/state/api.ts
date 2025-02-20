/**
 * @fileOverview Define API of the server-client communication
*/
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export interface GameTile {
  title: string
  short: string
  long: string
  languages: Array<string>
  prerequisites: Array<string>
  worlds: number
  levels: number
  image: string
}

export interface WorldType {
  nodes: {
    id: string,
    title: string,
    introduction: string,
    image: string
  },
  edges: string[][]
}

export type WorldTocType = Map<string, string[]>

export interface GameInfo {
  title: null|string,
  introduction: null|string,
  info: null|string,
  worlds: null|WorldType,
  worldSize: null|{[key: string]: number},
  worldToc: null|WorldTocType,
  authors: null|string[],
  conclusion: null|string,
  tile: null|GameTile,
  image: null|string,
  worldSort: string[] | null; // 添加 worldSort 字段
}

export interface InventoryTile {
  name: string,
  displayName: string,
  category: string,
  disabled: boolean,
  locked: boolean,
  new: boolean,
  hidden: boolean
  altTitle: string,
}

export interface LevelInfo {
  title: null|string,
  introduction: null|string,
  conclusion: null|string,
  index: number,
  tactics: InventoryTile[],
  lemmas: InventoryTile[],
  definitions: InventoryTile[],
  descrText: null|string,
  descrFormat: null|string,
  lemmaTab: null|string,
  statementName: null|string,
  displayName: null|string,
  template: null|string,
  image: null|string
}

/** Used to display the inventory on the welcome page */
export interface InventoryOverview {
  tactics: InventoryTile[],
  lemmas: InventoryTile[],
  definitions: InventoryTile[],
  lemmaTab: null,
}

interface Doc {
  name: string,
  displayName: string,
  content: string,
  statement: string,
  type: string, // TODO: can I remove these?
  category: string,
}

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({ baseUrl: window.location.origin + "/data" }),
  endpoints: (builder) => ({
    getGameInfo: builder.query<GameInfo, {game: string}>({
      query: ({game}) => `${game}/game.json`,
      transformResponse: (response: GameInfo) => {
        if (response.worlds) {
          // 如果有世界数据，执行拓扑排序
          const sortedWorlds = topologicalSort(response.worlds);
          return { ...response, worldSort: sortedWorlds }; // 将排序结果加入到返回的 GameInfo 中
        }
        return response;
      }
    }),
    loadLevel: builder.query<LevelInfo, {game: string, world: string, level: number}>({
      query: ({game, world, level}) => `${game}/level__${world}__${level}.json`,
    }),
    loadInventoryOverview: builder.query<InventoryOverview, {game: string}>({
      query: ({game}) => `${game}/inventory.json`,
    }),
    loadDoc: builder.query<Doc, {game: string, name: string, type: "lemma"|"tactic"}>({
      query: ({game, type, name}) => `${game}/doc__${type}__${name}.json`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetGameInfoQuery, useLoadLevelQuery, useLoadDocQuery, useLoadInventoryOverviewQuery } = apiSlice

/** Perform topological sort on the worlds graph */
export function topologicalSort(worlds: WorldType) : string[] {
  const visited = new Set();
  const temp = new Set();
  const order: string[] = [];
  const graph = new Map();

  // Build adjacency list
  for (const id in worlds.nodes) {
    graph.set(id, []);
  }
  for (const [source, target] of worlds.edges) {
    graph.get(source).push(target);
  }

  function visit(id: string): boolean {
    if (temp.has(id)) return false; // Found cycle
    if (visited.has(id)) return true;

    temp.add(id);

    const neighbors = graph.get(id) || [];
    for (const next of neighbors) {
      if (!visit(next)) return false;
    }

    temp.delete(id);
    visited.add(id);
    order.unshift(id);
    return true;
  }

  for (const id in worlds.nodes) {
    if (!visited.has(id) && !visit(id)) {
      console.error("Cycle detected in worlds graph");
      return Object.keys(worlds.nodes); // Fallback to unsorted list
    }
  }

  return order;
}
