import ctx from './audioContext';

// TODO: Make more functional approach. Connect to redux store and have gain value come from there.
const destination = ctx.createGain();
destination.gain.value = 0.1;
destination.connect(ctx.destination);

export default destination;
