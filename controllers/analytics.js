const moment = require('moment')
const Order = require('../models/Order')
const errorHandler = require('../utils/errorHandler')

module.exports.overview = async function(req, res) {
  try {
    const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
    // карта для підрахунку днів та замовлень.
    const ordersMap = getOrdersMap(allOrders)
    const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || []

    // К-ть замовлень вчора.
    const yesterdayOrdersNumber = yesterdayOrders.length
    // К-ть замовлень
    const totalOrdersNumber = allOrders.length
    // Загальна к-ть днів
    const daysNumber = Object.keys(ordersMap).length
    // Замовлення за день
    const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0)
    // ((замовлення вчора\ кть замовлень в день) - 1) * 100
    // Відсоток замовлень
    const ordersPercent = (((yesterdayOrdersNumber / ordersPerDay) - 1) * 100).toFixed(2)
    // Загальний дохід
    const totalGain = calculatePrice(allOrders)
    // Дохід за день
    const gainPerDay = totalGain / daysNumber
    // Дохід за вчора
    const yesterdayGain = calculatePrice(yesterdayOrders)
    // Відсоток доходу
    const gainPercent = (((yesterdayGain / gainPerDay) - 1) * 100).toFixed(2)
    // Порівняння доходу
    const compareGain = (yesterdayGain - gainPerDay).toFixed(2)
    // Порівняння к-ті замовлень
    const compareNumber = (yesterdayOrdersNumber - ordersPerDay).toFixed(2)

    res.status(200).json({
      gain: {
        percent: Math.abs(+gainPercent),
        compare: Math.abs(+compareGain),
        yesterday: +yesterdayGain,
        isHigher: +gainPercent > 0
      },
      orders: {
        percent: Math.abs(+ordersPercent),
        compare: Math.abs(+compareNumber),
        yesterday: +yesterdayOrdersNumber,
        isHigher: +ordersPercent > 0
      }
    })

  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.analytics = async function(req, res) {
  try {
    const allOrders = await Order.find({user: req.user.id}).sort({date: 1})
    const ordersMap = getOrdersMap(allOrders)
    // середній чек.
    const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2)
    // обєкт з даними для графіків.
    const chart = Object.keys(ordersMap).map(label => {
      // label == дата
      const gain = calculatePrice(ordersMap[label])
      const order = ordersMap[label].length

      return {label, order, gain}
    })


    res.status(200).json({average, chart})

  }catch(e){
    errorHandler(res,e)
  }
}
// обробка функцією днів та замовлень.
function getOrdersMap(orders = []) {
  const daysOrders = {}
  orders.forEach(order => {
    const date = moment(order.date).format('DD.MM.YYYY')
    // якщо співпадіння по сьогоднішньому дню його не включаємо.
    if (date === moment().format('DD.MM.YYYY')) {
      return
    }

    if (!daysOrders[date]) {
      daysOrders[date] = []
    }

    daysOrders[date].push(order)
  })
  return daysOrders
}

function calculatePrice(orders = []) {
  return orders.reduce((total, order) => {
    const orderPrice = order.list.reduce((orderTotal, item) => {
      return orderTotal += item.cost * item.quantity
    }, 0)
    return total += orderPrice
  }, 0)
}
