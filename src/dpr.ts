const getDevicePixelRatio = () => {
  const params = new URLSearchParams(location.search);
  const forceDpr = params.get('dpr');
  if (forceDpr){
    return Math.floor(parseInt(forceDpr));
  }
  return Math.floor(window.devicePixelRatio);
}

const DPR = getDevicePixelRatio();

export {
  DPR
}