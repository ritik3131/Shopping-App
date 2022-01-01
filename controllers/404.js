exports.errorfunction=(req, res, next) => {
    //Adding Html directly
    // res.status(404).send('<h1>Page not Found</h1>');
  
    //Adding by the useof module
    //res.status(404).sendFile(path.join(__dirname,'page_not_found.html'));
  
    //Adding by using the template engine
    res.status(404).render("404", { pagetitle: "Page Not Found" });
  };
  exports.get500error=(req, res, next) => {
    res.status(500).render("500", { pagetitle: "Error!" });
  };
