# Paging
A Mendix widget that allows custom pagination for Mendix listview by utilizing `limit` and `offset` properties of **Retrieve from database** actions.
This widget boosts performance of the listview widget by changing and retrieving only a single, limited page from data set.

Widget can be used in addition to [OQL module](https://appstore.home.mendix.com/link/app/66876/).

## Typical usage scenario
It's useful in applications that require listing large quantities of data on the listview widget and e.g.:
- `Load more` button is not preferable.
- Listview Controls Pagination widget cannot be used e.g. due to implementing custom filters not provided by default that would require configuring microflow data source.
- Bad list loading performance due to large quantity of data or enabled list editability.

## Usage
Place the widget inside data view and provide the following settings:
- `Offset`: Integer attribute - number of currently displayed page. ***Default value must be 1***.
- `List count`: Integer attribute - size of data set. Used for calculation of a number of available pages.
- `Page size`: Integer attribute - maximum number of rows to display on single listview page. Should be lower or the same as a `Page size` parameter of Listview widget.

It's adviced to create non-persistent entity containing required attributes. This entity can then be used as a page/list context object or as a generalisation for a specialized context e.g.:

![Context entity](/assets/domain_model.png?raw=true "Context entity")

By utilizing generalisation it's possible to insert the widget into a snippet and reuse it in every page that implements generalised context object:
![Paging widget snippet](/assets/widget_snippet.png?raw=true "Paging widget snippet")

To utilize the widget, listview data source must be configure to a *Microflow*:
![Example data source microflow](/assets/example_data_source.png?raw=true "Example data source microflow")
Required steps:
1. Count all target entity entries by combining `Retrieve from database` and `Count` aggregate actions.
2. Update context object's `List count` attribute to value returned by `Count` action
3. Retrieve paged data set from target entity by using *Custom* range option and context entity's attributes connected to the widget parameters:
   - *Offset*: `Page size * (Offset - 1)`
    **Note:** `Offset - 1` will return value 0 for page 1. Widget uses Offset parameter as a page number (starting from 1) while retrieved data are indexed starting from 0.
   - *Amount*: `Page size`
   - *Sorting*: Without providing sort attribute it won't be guarantied that the same page will always contain the same subset of data.
![Example data retrieve](/assets/example_retrieve.png?raw=true "Example data retrieve")

**Note:** Extending retrieving data with filtering by XPath would require providing query to **both** retrieve with count and data retrieve.

For usage example please refer to test project provided in repository.
