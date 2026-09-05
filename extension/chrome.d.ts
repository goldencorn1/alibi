declare namespace chrome {
  namespace runtime {
    function sendMessage(message: unknown, callback?: (response: any) => void): void;
    function onMessageAddListener(listener: (message: any, sender: any, sendResponse: (response: any) => void) => boolean | void): void;
    const onMessage: { addListener: typeof onMessageAddListener };
  }
  namespace tabs {
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }, callback: (tabs: Array<{ url?: string }>) => void): void;
  }
}
