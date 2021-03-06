import "jest";
import { Container, Model, TypeName } from "../src/pouch";

const unit = "Unit";
const testing = "Testing";

@TypeName(unit)
class Unit extends Model<Unit> {
  _id?: string;
  name: string;
}

@TypeName(testing)
class Testing extends Model<Testing> {
  _id?: string;
  name: string;
  date: Date;
}

test("Testing for decorators to identify a class", async () => {
  expect(Unit.__typename).toBe(unit);
  expect(Testing.__typename).toBe(testing);
});

test("Test the pouchdb container developed by hehena", async () => {
  let repository: Container = new Container("db_testing", {
    ajax: { cache: false },
    auth: {
      username: "ambit",
      password: "ambit"
    },
    adapter: "memory"
  });
  try {
    await repository.addModels([Unit, Testing]);

    let unitModel: Unit = { name: "Unit" };

    let testingModel: Testing = { name: "Testing", date: new Date() };

    let res = await Unit.insertOne(unitModel);
    expect(res.ok).toBe(true);

    Unit.change({ since: "now", live: true, include_docs: true }).on(
      "change",
      (_info: any) => {
        // console.log(info);
      }
    );

    res = await Unit.insertOne(unitModel);

    expect(res.ok).toBe(true);

    res = await Testing.insertOne(testingModel);

    expect(res.ok).toBe(true);

    res = await repository.safePurge();
    expect(res.ok).toBe(false);

    let docs = await Unit.findAll();

    expect(docs.length).toBe(2);

    res = await Unit.deleteOne(docs[0]._id);
    expect(res.ok).toBe(true);

    res = await Unit.deleteOne(docs[1]._id);
    expect(res.ok).toBe(true);

    docs = await Testing.findAll({
      selector: {
        _id: { $gt: null }
      }
    });

    expect(docs.length).toBe(1);

    res = await Testing.deleteOne(docs[0]._id);
    expect(res.ok).toBe(true);

    res = await Testing.insertOne(testingModel);

    expect(res.ok).toBe(true);

    res = await Testing.insertOne(testingModel);

    expect(res.ok).toBe(true);

    docs = await Testing.findAll();

    expect(docs.length).toBe(2);

    await Unit.insertOne(unitModel);

    await Testing.deleteAll();

    docs = await Testing.findAll();

    expect(docs.length).toBe(0);

    res = await repository.safePurge();
    expect(res.ok).toBe(false);

    await Unit.deleteAll();

    res = await repository.safePurge();
    expect(res.ok).toBe(true);
  } catch (reason) {
    fail(reason.message);
  } finally {
    await repository.close();
  }
});
