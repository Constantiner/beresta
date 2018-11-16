const stupidLayout = loggingEvent => loggingEvent.reduce((str, chunk) => str + JSON.stringify(chunk), "");

export default stupidLayout;
