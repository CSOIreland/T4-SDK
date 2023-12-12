# JS Organisation Chart Library for "Terminal Four" CMS

This documentation outlines the content types used in the JS Organisation Chart Library developed for the "Terminal Four" CMS.



<details>
<summary><strong>Organisation Chart Container - Start</strong></summary>
<br>

**Description:**  
Wrapper content type used to contain the defined data structure and the newly instantiated organisation chart. It defines the top parent node, which is mandatory. Each chart instance requires one container.

**Inputs:**

| Input Field        | Description                                      | Type                   | Required |
|--------------------|--------------------------------------------------|------------------------|----------|
| Employee Name      | Name of the employee                             | String (80 char max)   | Yes      |
| Title              | Title of the employee                            | String (80 char max)   | Yes      |
| Department         | Department of the employee                       | String (80 char max)   | Yes      |
| Bio (Biography)    | Biography of the employee                        | HTML String (5000 char)| No       |
| Image              | Image path of the employee                       | Media Path             | No       |
| Acting             | Adds 'Acting' in front of title                  | Checkbox               | No       |
| Depth              | Level at which nodes start collapsing            | Number                 | No       |
| Vertical Depth     | Level at which nodes display vertically          | Number                 | No       |

</details>

<details>
<summary><strong>Organisation Chart Container - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart Container.

</details>

<details>
<summary><strong>Organisation Chart Child List - Start</strong></summary>
<br>

**Description:**  
Wrapper for child items in the organisation chart. Each new level must be wrapped in this content type.

</details>

<details>
<summary><strong>Organisation Chart Child List - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart Child List. The immediate parent must be either a child list item or an organisation chart container.

</details>

<details>
<summary><strong>Organisation Chart List Item - Start</strong></summary>
<br>

**Description:**  
Defines a child node in the organisation chart, allowing for the nesting of other child lists.

**Inputs:**  
Same as the Organisation Chart Container, excluding 'Depth' and 'Vertical Depth'.

</details>

<details>
<summary><strong>Organisation Chart List Item - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart List Item.

</details>

<details>
<summary><strong>Organisation Chart List Item - Leaf</strong></summary>
<br>

**Description:**  
Similar to the Organisation Chart List Item Start, but does not allow nesting. Includes the closing tag within.

**Inputs:**  
Same as the Organisation Chart List Item.

</details>

## Functionalities Overview by Content Type

| Content Type                               | Naming Convention                   | Description                                                                                       | Key Functionalities                                                             |
|--------------------------------------------|-------------------------------------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| **Organisation Chart Container - Start**   | `Level 0 start`                     | Wrapper for the entire organisation chart structure, including the top parent node.               | - Defines top parent node<br>- Contains chart data structure<br>- Essential for chart instantiation    |
| **Organisation Chart Container - End**     | `Level 0 end`                       | Closing tag for the Organisation Chart Container.                                                 | - Marks the end of the chart container                                         |
| **Organisation Chart Child List - Start**  | `Lx-y list start ID`                | Wrapper for child items in the organisation chart, used for creating new levels.                  | - Encapsulates child nodes<br>- Essential for hierarchical structure            |
| **Organisation Chart Child List - End**    | `Lx-y list end ID`                  | Closing tag for the Organisation Chart Child List.                                                | - Marks the end of a child list                                                |
| **Organisation Chart List Item - Start**   | `Lx-y start ID`                     | Defines a child node in the organisation chart, allowing for nesting of additional child lists.   | - Creates a child node<br>- Allows nesting of other child lists                |
| **Organisation Chart List Item - End**     | `Lx-y end ID`                       | Closing tag for the Organisation Chart List Item.                                                 | - Marks the end of a list item                                                 |
| **Organisation Chart List Item - Leaf**    | `LLx-y ID`                          | Similar to the Organisation Chart List Item Start, but does not allow further nesting.            | - Defines a leaf node<br>- Includes an integrated closing tag                  |

Where:
- `x` represents the Node level.
- `y` represents the Branch number for a specific level.
- `ID` represents a unique identifier (e.g., #01).

This table provides an overview of the various content types used in the organisation chart library, their naming conventions based on node level, branch number, and unique ID, along with their primary functionalities. Each content type plays a specific role in structuring and displaying the organisational hierarchy within the "Terminal Four" CMS.

## Building the app & development

#### Requirements:

\>= Node 16

=> NPM 10

#### Install dependencies:
```
npm i
```

#### Run app and autoreload on 'localhost:3000':
```
npm run dev
```

#### Build dev:
```
npm run build
```

This will manually update the dev build. The dev build is located in ```'page/dist'```


#### Build production:
```
npm run build
```

This will manually update the production build. The production build is located in ```'/dist'```

#### Update color variables in CSS:
Colors are defined in a mixin in
```
src/assets/_theme.scss
```

#### Constants & scss interpolation:
Constants are defined in ```'constants.mjs'```.

They are referenced through the whole app and can also be referenced in scss files with the following syntax:

```scss
__{CONSTANT_NAME}__
```

e.g.:

If we have a constant defined in
constants.mjs -> ```export const MY_CONSTANT = "my_namespaced_constant"```

in the any scss file we can refer it
```
.__MY_CONSTANT__ {
    "css code"...
}
```

and after the build process it will be
```
.my_namespaced_constant {
    "css code"
}
```

#### HTML template interpolation:

HTML templates should be defined as ```page/template.html```

With specific selectors we can define where content should be injected in the template.

###### Metadata: ``` ${rollup_metas} ```
###### Links (css): ``` ${rollup_links} ```
###### JS: ``` ${rollup_scripts} ```
