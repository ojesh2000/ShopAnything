const getToken = (req) => {
  if(req.get('Cookie') === null)return null;
  let cookies = req.get('Cookie').split('=');
  for(let i = 0;i < cookies.length;++i){
    if(cookies[i] === 'token'){
      let token = '';
      for(let j = 0;j < cookies[i + 1].length;++j){
        if(cookies[i + 1][j] === ';'){
          break ;
        }
        else{
          token += cookies[i + 1][j];
        }
      }
      return token;
    }
  }
  return null;
}

exports.get404 = (req, res, next) => {
  let b = getToken(req);
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404',
  isAuthenticated: (b != 'deleted' && b != null) });
};
