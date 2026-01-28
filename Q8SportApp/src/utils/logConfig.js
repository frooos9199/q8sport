// Suppress common iOS warnings
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'UIRefreshControl',
  'nw_protocol_socket_set_no_wake_from_sleep',
  'RCTScrollViewComponentView',
]);

// Ignore all logs in production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

export default LogBox;
