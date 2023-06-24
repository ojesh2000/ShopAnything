const getToken = (req) => {
  if(req.get('Cookie') === null){
    return null;
  }
  let cookies = req.get('Cookie').split(';');
  for(let i = 0;i < cookies.length;++i){
    cookies[i] = cookies[i].trim();
    if(cookies[i].split('=')[0] === 'token'){
      return cookies[i].split('=')[1];
    }
  }
  return null;
}

exports.get404 = (req, res, next) => {
  let b = getToken(req);
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404',
  isAuthenticated: (b != 'deleted' && b != null) });
};
