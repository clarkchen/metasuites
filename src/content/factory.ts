import { isMatchURL } from '@common/utils'
import allowlist from '@common/config/allowlist'

const REGISTRY = [
  // all_frames: true
  {
    matches: allowlist.ETHERSCAN_V2_MATCHES,
    allFrames: true,
    load: () => import('./etherscan').then(m => m.EtherscanV2Initializer)
  },
  {
    matches: allowlist.BLOCKSCOUT_MATCHES,
    allFrames: true,
    load: () => import('./blockscout').then(m => m.BlockscoutInitializer)
  },
  // all_frames: false
  {
    matches: allowlist.BTC_EXPLORER_MATCHES,
    allFrames: false,
    load: () => import('./btc').then(m => m.BTCInitializer)
  },
  {
    matches: allowlist.BLOCKSEC_MATCHES,
    allFrames: false,
    load: () => import('./blocksec').then(m => m.BlockSecInitializer)
  },
  {
    matches: allowlist.TRONSCAN_MATCHES,
    allFrames: false,
    load: () => import('./tronscan').then(m => m.TronscanInitializer)
  },
  {
    matches: allowlist.MERLIN_SCAN_MATCHES,
    allFrames: false,
    load: () => import('./merlin').then(m => m.MerlinInitializer)
  },
  {
    matches: allowlist.MS_MATCHES,
    allFrames: false,
    load: () => import('./metasleuth').then(m => m.MetaSleuthInitializer)
  },
  {
    matches: allowlist.SOLSCAN_MATCHES,
    allFrames: false,
    load: () => import('./solscan').then(m => m.SolscanInitializer)
  },
  {
    matches: allowlist.SOLANA_EXPLORER_MATCHES,
    allFrames: false,
    load: () => import('./solanaexpl').then(m => m.SolanaExplorerInitializer)
  },
  {
    matches: allowlist.DEBANK_MATCHES,
    allFrames: false,
    load: () => import('./debank').then(m => m.DebankInitializer)
  },
  {
    matches: allowlist.ARKHAM_MATCHES,
    allFrames: false,
    load: () => import('./arkham').then(m => m.ArkhamInitializer)
  },
  {
    matches: allowlist.JITO_MATCHES,
    allFrames: false,
    load: () => import('./jito').then(m => m.JitoInitializer)
  }
]

export const createInitializer = async (url: string, allFrames = false) => {
  for (const entry of REGISTRY) {
    if (entry.allFrames === allFrames && isMatchURL(url, entry.matches)) {
      const Cls = await entry.load()
      return new Cls()
    }
  }
  return null
}
