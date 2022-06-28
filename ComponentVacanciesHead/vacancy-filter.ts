import { ExpressMiddleware } from '../../contracts/ServerMiddleware'
import { Logger } from '../../composition/Logger'
import { client } from '../../modules/apollo'
import { dataVacancyFilters } from '../../apollo/queries/dataVacancyFilters'
import { vacancyFiltersAdapter } from '../../apollo/adapters/modules/vacancyFiltersAdapter'

const vacancyFilterController: ExpressMiddleware = async (req, res) => {
  try {
    const {
      data: { specialties, regions },
    } = await client.query({ query: dataVacancyFilters })
    const listRegions = vacancyFiltersAdapter(regions)
    const listSpecialties = vacancyFiltersAdapter(specialties)
    return res.send({ listRegions, listSpecialties })
  } catch (e) {
    Logger.error('news:', e)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.send(JSON.stringify(e))
  }
}

export default vacancyFilterController
