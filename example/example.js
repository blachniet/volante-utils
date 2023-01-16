module.exports = {
  name: 'UtilsExample',
  init() {
    this.test_get();
    this.test_pick();
    this.test_omit();
    this.test_generateId();
    this.test_clone();
    this.test_flatMap();
  },
  data() {
    return {
      testObject1: {
        sub1: { sub2: { leaf: 1 }}
      },
      aryOfObjects: [
        {
          name: 'Joe',
          username: 'jborden',
          attributes: {
            height: '5\'11"',
          },
        },
        {
          name: 'Jane',
          username: 'janee',
          attributes: {
            height: '5\'9"',
          },
        },
      ],
    };
  },
  methods: {
    test_get() {
      console.log(this.$.VolanteUtils.get(this.testObject1, 'sub1.sub2.leaf'));
    },
    test_pick() {
      console.log(this.$.VolanteUtils.pick({
        a: 1,
        b: 2,
        c: 3,
      }, ['a', 'b']));
    },
    test_omit() {
      console.log(this.$.VolanteUtils.omit({
        a: 1,
        b: 2,
        c: 3,
      }, ['a', 'b']));
    },
    test_generateId() {
      console.log(this.$.VolanteUtils.generateId(16));
    },
    test_clone() {
      let testClone = this.$.VolanteUtils.clone(this.testObject1);
      testClone.sub1.sub2.leaf = 2;
      console.log('these objects should be different:', this.testObject1, testClone);
    },
    test_flatMap() {
      console.log(this.$.VolanteUtils.flatMap(this.aryOfObjects, 'attributes.height'));
    },
  },
};