const chartController = require('../controllers/chart.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.get('/chart/lastweek', _AuthCheck, chartController.getChartByLastweek);
    router.get('/chart/lastmonth', _AuthCheck, chartController.getChartByLastmonth);
    router.post('/chart/pickdate', _AuthCheck, chartController.getChartByPickedDate);
    router.get('/chart/box1', _AuthCheck, chartController.getDataForBox1);
    router.get('/chart/box2', _AuthCheck, chartController.getDataForBox2);
    router.get('/chart/box3', _AuthCheck, chartController.getDataForBox3);
    router.get('/chart/box4', _AuthCheck, chartController.getDataForBox4);
}