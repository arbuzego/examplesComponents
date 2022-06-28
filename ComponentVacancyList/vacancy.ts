import { ExpressMiddleware } from '../../contracts/ServerMiddleware'
import { Logger } from '../../composition/Logger'
import { client } from '../../modules/apollo'
import { vacancies } from '../../apollo/queries/vacancies'
import { listVacanciesAdapter } from '../../apollo/adapters/modules/listVacanciesAdapter'

const vacancyController: ExpressMiddleware = async (req, res) => {
  try {
    const filters = {
      first: Number(req.query?.first) || 5,
      filter: { AND: [], iblock: { code: { equals: 'vacancy' } } },
    }
    if (req.query?.search) {
      filters.filter.AND.push({
        OR: [
          { name: { contains: req.query?.search } },
          {
            propertyValuesRelation: {
              some: {
                targetElement: {
                  name: { contains: req.query?.search },
                },
              },
            },
          },
        ],
      })
    }
    if (req.query?.region) {
      filters.filter.AND.push({
        propertyValuesRelation: {
          some: {
            property: { code: { equals: 'region' } },
            targetElement: { id: { equals: req.query.region } },
          },
        },
      })
    }
    if (req.query?.speciality) {
      filters.filter.AND.push({
        propertyValuesRelation: {
          some: {
            property: { code: { equals: 'specialization' } },
            targetElement: { id: { equals: req.query.speciality } },
          },
        },
      })
    }
    const {
      data: { elements, elementsCount },
    } = await client.query({
      query: vacancies,
      variables: filters,
    })
    const vacancyData = listVacanciesAdapter(elements)
    return res.send({ elementsCount, vacancyData })
  } catch (e) {
    Logger.error('news:', e)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.send(JSON.stringify(e))
  }
}

export default vacancyController
