/* eslint-disable-next-line no-console */
const consoleLog = console.log.bind(console);

const consoleAppender = layout => loggingEvent => consoleLog(layout(loggingEvent));

export default consoleAppender;