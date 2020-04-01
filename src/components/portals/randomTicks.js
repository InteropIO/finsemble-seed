
const createTick = () => {
    const changes = [0, 0.00001, 0.00002,
        0.00003, 0.00009,  -0.00001, -0.00001, 0]
    return changes[Math.floor(Math.random() * changes.length)]
}

export const generateTick = (list) => {
    return list.map((item) => {
        const tick = {
            bid: item.bid + createTick(),
            ask: item.ask + createTick(),
            bidClass: '',
            askClass: ''
        }
        if (tick.bid > item.bid) tick.bidClass = 'up'
        if (tick.ask > item.ask) tick.askClass = 'up'
        if (tick.bid < item.bid) tick.bidClass = 'down'
        if (tick.ask < item.ask) tick.askClass = 'down'

        return {
            ...item,
            ...tick
        }
    })
}