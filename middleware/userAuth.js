const userAuthentication = (async(req,res,next)=>{
    
    if (req.session && req.session.isBlocked) {
        res.redirect('/logout');
        // todo: block logic
        return;
    }
    
    if(req.session && req.session.email){
        next()
    }else{
        res.redirect('/signin')
    }
})

module.exports = {
    userAuthentication
}