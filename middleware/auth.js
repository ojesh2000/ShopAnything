const jwt = require('jsonwebtoken');

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

exports.mid = async(req , res , next) => {
  const b = getToken(req);
  if(b === 'deleted' || !b){
    return res.redirect('/');
  }
  let isEqual = jwt.verify(b , 'secret');
  let token = jwt.decode(b , 'secret');
  if(Date.now() > token.exp * 1000){
    res.setHeader('Set-Cookie' , 'token=deleted; Max-Age=0 HttpOnly');
    return res.redirect('/');
  }
  if(!isEqual){
    return res.redirect('/');
  }
  next();
}